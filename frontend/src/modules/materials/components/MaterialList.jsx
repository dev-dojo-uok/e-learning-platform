import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Eye, Download, Trash2, FileText, Video, Image, FileArchive, Inbox, HelpCircle, ClipboardList, Lock } from 'lucide-react';
import { getMaterialsByModule, deleteMaterial } from '../services/materialService';
import useAuthStore from '../../../store/useAuthStore';
import MaterialViewer from './MaterialViewer';
import { Button } from '@/components/ui/button';

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

const MaterialList = ({ moduleId, courseId, isEnrolled, refreshTrigger, onDeleteSuccess }) => {
  const { user } = useAuthStore();
  const isTeacherOrAdmin = user?.role === 'TEACHER' || user?.role === 'ADMIN';
  const navigate = useNavigate();

  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadMaterials = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMaterialsByModule(moduleId);
      setMaterials((data || []).map((m) => ({ ...m, _id: m.id })));
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load materials.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (moduleId) {
      loadMaterials();
    }
  }, [moduleId, refreshTrigger]);

  const handleMaterialClick = (mat) => {
    if (mat.type === 'QUIZ') {
      if (isTeacherOrAdmin) {
        navigate(`/quizzes/${mat.itemId}/manage`);
      } else {
        navigate(`/quizzes/${mat.itemId}/take`);
      }
    } else if (mat.type === 'ASSIGNMENT') {
      navigate(`/assignments?courseId=${courseId || ''}&assignmentId=${mat.itemId || ''}`);
    } else {
      setSelectedMaterial(mat);
    }
  };

  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      await deleteMaterial(id);
      setMaterials((prev) => prev.filter((m) => m._id !== id));
      setDeleteConfirmId(null);
      onDeleteSuccess?.('Material deleted successfully.');
    } catch (err) {
      // Handled locally
    } finally {
      setDeleting(false);
    }
  };

  const getIconAndColor = (type, contentUrl) => {
    if (type === 'QUIZ') {
      return { icon: <HelpCircle className="h-5 w-5" />, color: 'text-amber-600 bg-amber-50 border-amber-200' };
    }
    if (type === 'ASSIGNMENT') {
      return { icon: <ClipboardList className="h-5 w-5" />, color: 'text-primary bg-primary/10 border-primary/20' };
    }
    if (type === 'PDF') {
      return { icon: <FileText className="h-5 w-5" />, color: 'text-destructive bg-destructive/10 border-destructive/20' };
    }
    if (type === 'VIDEO_SRC' || type === 'VIDEO_EMBED' || type === 'VIDEO' || type === 'YOUTUBE') {
      return { icon: <Video className="h-5 w-5" />, color: 'text-foreground bg-muted border-border' };
    }
    if (type === 'IMAGE' || (contentUrl && /\.(jpg|jpeg|png|webp|gif)$/i.test(contentUrl))) {
      return { icon: <Image className="h-5 w-5" />, color: 'text-foreground bg-muted border-border' };
    }
    if (contentUrl && contentUrl.endsWith('.zip')) {
      return { icon: <FileArchive className="h-5 w-5" />, color: 'text-foreground bg-muted border-border' };
    }
    return { icon: <FileText className="h-5 w-5" />, color: 'text-muted-foreground bg-muted/50 border-border' };
  };

  //-------------- Loading state ---------------------------------------------
  if (loading && materials.length === 0) {
    return (
      <div className="flex flex-col gap-4 animate-in fade-in duration-300">
        <div className="flex items-center gap-2 text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span className="text-sm font-medium">Loading materials…</span>
        </div>
        <div className="flex flex-col gap-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-20 rounded-xl bg-slate-100 animate-pulse border border-slate-200" />
          ))}
        </div>
      </div>
    );
  }

  // ---------- Error state --------------------
  if (error && materials.length === 0) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
        <span className="font-semibold">Failed to load materials:</span> {error}
      </div>
    );
  }

  // ----------------- Empty state --------------------
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
      {/* Flex: one below one */}
      <div className="flex flex-col gap-3">
        {materials.map((mat) => {
          const { icon, color } = getIconAndColor(mat.type, mat.contentUrl);
          const downloadUrl = mat.contentUrl ? getMaterialUrl(mat.contentUrl) : null;

          return (
            <div
              key={mat._id}
              className="bg-card border border-border p-4 rounded-xl hover:shadow-sm hover:border-primary/50 transition-all duration-200 flex items-start justify-between gap-4"
            >
              <div className="flex items-start gap-3 min-w-0">
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
              </div>

              {/* Actions row */}
              <div className="flex items-center gap-1 self-center flex-shrink-0">
                {!isTeacherOrAdmin && !isEnrolled ? (
                  <div className="flex items-center gap-1 text-slate-400" title="Enroll in the course to unlock this material">
                    <Lock className="h-4 w-4 text-slate-400" />
                    <span className="text-xs font-semibold hidden sm:inline">Locked</span>
                  </div>
                ) : (
                  <>
                    {/* Preview Button */}
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleMaterialClick(mat)}
                      title="Preview"
                      className="text-slate-400 hover:text-primary"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>

                    {/* Download Button */}
                    {downloadUrl && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        asChild
                        title="Download"
                        className="text-slate-400 hover:text-primary"
                      >
                        <a href={downloadUrl} download>
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                    )}

                    {/* Delete Button (Teacher/Admin only) */}
                    {isTeacherOrAdmin && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setDeleteConfirmId(mat._id)}
                        title="Delete"
                        className="text-slate-400 hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </>
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
          <div className="bg-card w-full max-w-sm rounded-2xl border border-border p-6 shadow-2xl flex flex-col gap-4 animate-in zoom-in-95 duration-200">
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Delete Material?</h3>
              <p className="text-sm text-slate-500 mt-1">
                This action cannot be undone. The uploaded resource file will be removed permanently.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirmId(null)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Deleting…
                  </>
                ) : (
                  'Delete'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialList;
