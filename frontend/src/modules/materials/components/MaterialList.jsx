import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Eye, Download, Trash2, FileText, Video, Image, FileArchive, Inbox, HelpCircle } from 'lucide-react';
import useMaterials from '../hooks/useMaterials';
import useAuthStore from '../../../store/useAuthStore';
import MaterialViewer from './MaterialViewer';

// Date formatter helper
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

const getMaterialUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const backendBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const serverOrigin = backendBase.replace('/api', '');
  return `${serverOrigin}/${url}`;
};

const MaterialList = ({ moduleId, onDeleteSuccess }) => {
  const { materials, loading, error, fetchMaterials, removeMaterial } = useMaterials();
  const { user } = useAuthStore();
  const isTeacherOrAdmin = user?.role === 'TEACHER' || user?.role === 'ADMIN';
  const navigate = useNavigate();

  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleMaterialClick = (mat) => {
    if (mat.type === 'QUIZ') {
      if (isTeacherOrAdmin) {
        navigate(`/quizzes/${mat.itemId}/manage`);
      } else {
        navigate(`/quizzes/${mat.itemId}/take`);
      }
    } else {
      setSelectedMaterial(mat);
    }
  };

  useEffect(() => {
    if (moduleId) {
      fetchMaterials(moduleId);
    }
  }, [moduleId, fetchMaterials]);

  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      await removeMaterial(id);
      setDeleteConfirmId(null);
      onDeleteSuccess?.('Material deleted successfully.');
    } catch (err) {
      // handled by store error
    } finally {
      setDeleting(false);
    }
  };

  const getIconAndColor = (type, contentUrl) => {
    if (type === 'QUIZ') {
      return { icon: <HelpCircle className="h-5 w-5" />, color: 'text-amber-500 bg-amber-50 border-amber-100' };
    }
    if (type === 'PDF') {
      return { icon: <FileText className="h-5 w-5" />, color: 'text-red-500 bg-red-50 border-red-100' };
    }
    if (type === 'VIDEO_SRC' || type === 'VIDEO_EMBED' || type === 'VIDEO' || type === 'YOUTUBE') {
      return { icon: <Video className="h-5 w-5" />, color: 'text-indigo-500 bg-indigo-50 border-indigo-100' };
    }
    if (type === 'IMAGE' || (contentUrl && /\.(jpg|jpeg|png|webp|gif)$/i.test(contentUrl))) {
      return { icon: <Image className="h-5 w-5" />, color: 'text-emerald-500 bg-emerald-50 border-emerald-100' };
    }
    if (contentUrl && contentUrl.endsWith('.zip')) {
      return { icon: <FileArchive className="h-5 w-5" />, color: 'text-amber-500 bg-amber-50 border-amber-100' };
    }
    return { icon: <FileText className="h-5 w-5" />, color: 'text-blue-500 bg-blue-50 border-blue-100' };
  };

  // ── Loading state ────────────────────────────────────────────────────────────
  if (loading && materials.length === 0) {
    return (
      <div className="flex flex-col gap-4 animate-in fade-in duration-300">
        <div className="flex items-center gap-2 text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
          <span className="text-sm font-medium">Loading materials…</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-20 rounded-xl bg-slate-100 animate-pulse border border-slate-200" />
          ))}
        </div>
      </div>
    );
  }

  // ── Error state ──────────────────────────────────────────────────────────────
  if (error && materials.length === 0) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
        <span className="font-semibold">Failed to load materials:</span> {error}
      </div>
    );
  }

  // ── Empty state ──────────────────────────────────────────────────────────────
  if (!materials || materials.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-4 text-center border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50 animate-in fade-in duration-300">
        <Inbox className="h-8 w-8 text-slate-300 mb-2" strokeWidth={1.5} />
        <p className="text-sm font-semibold text-slate-600">No materials uploaded yet.</p>
        <p className="text-xs text-slate-400 mt-0.5">Uploaded learning sheets or reference videos will appear here.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-300">
      {/* Grid: 1 col on mobile, 2 col on tablet/desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {materials.map((mat) => {
          const { icon, color } = getIconAndColor(mat.type, mat.contentUrl);
          const downloadUrl = mat.contentUrl ? getMaterialUrl(mat.contentUrl) : null;

          return (
            <div
              key={mat._id}
              className="bg-white border border-slate-200 p-4 rounded-xl hover:border-indigo-200 hover:shadow-sm transition-all duration-200 flex items-start gap-4"
            >
              {/* Material Icon Badge */}
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center border flex-shrink-0 ${color}`}>
                {icon}
              </div>

              {/* Detail fields */}
              <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                <span className="text-sm font-bold text-slate-800 truncate" title={mat.title}>
                  {mat.title}
                </span>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {mat.type}
                </span>
                <span className="text-[10px] text-slate-400 mt-1">
                  Uploaded: {formatDate(mat.createdAt)}
                </span>
              </div>

              {/* Actions row */}
              <div className="flex items-center gap-1 self-center flex-shrink-0">
                {/* Preview Button */}
                <button
                  type="button"
                  id={`mat-preview-btn-${mat._id}`}
                  onClick={() => handleMaterialClick(mat)}
                  title="Preview"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  <Eye className="h-4 w-4" />
                </button>

                {/* Download Button */}
                {downloadUrl && (
                  <a
                    href={downloadUrl}
                    download
                    title="Download"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                )}

                {/* Delete Button (Teacher/Admin only) */}
                {isTeacherOrAdmin && (
                  <button
                    type="button"
                    id={`mat-delete-btn-${mat._id}`}
                    onClick={() => setDeleteConfirmId(mat._id)}
                    title="Delete"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Material Preview Modal */}
      {selectedMaterial && (
        <MaterialViewer
          material={selectedMaterial}
          isOpen={Boolean(selectedMaterial)}
          onClose={() => setSelectedMaterial(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-2xl border border-slate-200 p-6 shadow-2xl flex flex-col gap-4 animate-in zoom-in-95 duration-200">
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Delete Material?</h3>
              <p className="text-sm text-slate-500 mt-1">
                This action cannot be undone. The uploaded resource file will be removed permanently.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                disabled={deleting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={deleting}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:opacity-60 transition-colors"
              >
                {deleting ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Deleting…
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialList;
