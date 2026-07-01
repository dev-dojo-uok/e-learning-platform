import React, { useState } from 'react';
import { Pencil, Trash2, PlusCircle, BookOpen, ChevronRight } from 'lucide-react';
import useAuthStore from '../../../store/useAuthStore';
import { MaterialUpload, MaterialList } from '../../materials';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Modal from '@/components/Modal';

const ModuleCard = ({ module, courseId, isEnrolled, onEdit, onDelete }) => {
  const { user } = useAuthStore();
  const isTeacherOrAdmin = user?.role === 'TEACHER' || user?.role === 'ADMIN';
  const [isModuleOpen, setIsModuleOpen] = useState(true);

  const [showUpload, setShowUpload] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  return (
    <div className="bg-card text-card-foreground p-6  rounded-2xl border border-border shadow-sm flex flex-col gap-4">
      {/* Header containing order badge and actions */}
      <div className="flex items-center justify-between gap-2 ">
        <div className="flex items-center gap-2.5 min-w-0">
          <Button variant='sm' onClick={() => setIsModuleOpen(!isModuleOpen)} >
            <ChevronRight size={3} style={{
              rotate: isModuleOpen ? '90deg' : '0deg'
            }} />
          </Button>
          <Badge variant="secondary" className="shrink-0">
            {module.order}
          </Badge>
          <h3 className="font-bold text-slate-800 text-lg leading-tight truncate">
            {module.title}
          </h3>
        </div>
        {isTeacherOrAdmin && (
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onEdit?.(module)}
              title="Edit Module"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onDelete?.(module._id)}
              className="text-slate-400 hover:text-destructive hover:bg-destructive/10"
              title="Delete Module"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {isModuleOpen ? <>
        {/* Description */}
        {module.description ? (
          <p className="text-sm text-slate-500 leading-relaxed whitespace-pre-wrap pl-1 ">
            {module.description} HIloe
          </p>
        ) : (
          <></>
        )}

        {/* Materials outline header */}
        <div className=" border-t border-border pt-4">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-1.5 text-slate-700">
              <BookOpen className="h-4 w-4 text-primary" />
              <h4 className="text-sm font-bold uppercase tracking-wider">Learning Resources</h4>
            </div>
            {isTeacherOrAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowUpload(true)}
                className="gap-1"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                Add Material
              </Button>
            )}
          </div>

          {/* Upload Modal box */}
          {isTeacherOrAdmin && (
            <Modal
              isOpen={showUpload}
              onClose={() => setShowUpload(false)}
              title={`Upload Material for ${module.title}`}
              size="md"
            >
              <div className="pt-2">
                <MaterialUpload
                  moduleId={module._id}
                  courseId={courseId}
                  onSuccess={() => {
                    setRefreshTrigger((prev) => prev + 1);
                    setShowUpload(false);
                  }}
                />
              </div>
            </Modal>
          )}

          {/* Materials List */}
          <div className="pl-1">
            <MaterialList
              moduleId={module._id}
              courseId={courseId}
              isEnrolled={isEnrolled}
              refreshTrigger={refreshTrigger}
              onDeleteSuccess={() => setRefreshTrigger((prev) => prev + 1)}
            />
          </div>
        </div></> : <></>}
    </div>
  );
};

export default ModuleCard;
