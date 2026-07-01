import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, HelpCircle, Plus, X, ChevronRight, BookOpen, AlertCircle } from 'lucide-react';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';

export default function CalendarEventModal({
  isOpen,
  onClose,
  date,
  events = [],
  courses = [],
  isTeacher = false
}) {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [eventType, setEventType] = useState('assignment'); // 'assignment' | 'quiz'
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [modules, setModules] = useState([]);
  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [loadingModules, setLoadingModules] = useState(false);
  const [error, setError] = useState('');

  // Reset modal state on open
  useEffect(() => {
    if (isOpen) {
      setIsCreating(false);
      setError('');
      if (courses.length > 0) {
        setSelectedCourseId(courses[0]._id || courses[0].id);
      }
    }
  }, [isOpen, courses]);

  // Load modules dynamically when selected course changes (only for quiz type)
  useEffect(() => {
    if (isCreating && eventType === 'quiz' && selectedCourseId) {
      const fetchModules = async () => {
        setLoadingModules(true);
        setError('');
        try {
          const res = await api.get(`/modules/course/${selectedCourseId}`);
          const fetchedModules = res.data || [];
          setModules(fetchedModules);
          if (fetchedModules.length > 0) {
            setSelectedModuleId(fetchedModules[0].id);
          } else {
            setSelectedModuleId('');
            setError('This course has no modules created yet. You must create a module/section first.');
          }
        } catch (err) {
          console.error('Failed to load modules for course:', err);
          setError('Failed to load modules for this course.');
        } finally {
          setLoadingModules(false);
        }
      };
      fetchModules();
    }
  }, [isCreating, eventType, selectedCourseId]);

  if (!isOpen || !date) return null;

  const isSameDay = (d1, d2) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  const dayEvents = events.filter(e => isSameDay(new Date(e.date), date));

  const handleContinue = () => {
    if (!selectedCourseId) {
      setError('Please select a course.');
      return;
    }
    if (eventType === 'quiz' && !selectedModuleId) {
      setError('A course section/module is required to create a quiz.');
      return;
    }

    const dateIso = date.toISOString();
    if (eventType === 'assignment') {
      navigate(`/assignments?courseId=${selectedCourseId}&create=true&dueDate=${dateIso}`);
    } else {
      navigate(`/quizzes/create?courseId=${selectedCourseId}&moduleId=${selectedModuleId}&closeTime=${dateIso}`);
    }
    onClose();
  };

  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-card text-card-foreground rounded-2xl border border-border w-full max-w-md p-6 shadow-xl animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
          <div>
            <h3 className="font-bold text-lg text-foreground">
              {isCreating ? 'Create New Event' : 'Due Events'}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">{formattedDate}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={18} />
          </Button>
        </div>

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold rounded-lg flex items-start gap-2 mb-4">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span className="flex-1">{error}</span>
          </div>
        )}

        {/* Modal Content */}
        {!isCreating ? (
          <div className="space-y-4">
            {/* Events List */}
            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {dayEvents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm border border-dashed rounded-xl flex flex-col items-center justify-center gap-2">
                  <BookOpen size={24} className="opacity-40" />
                  <span>No events scheduled for this day</span>
                </div>
              ) : (
                dayEvents.map(event => (
                  <div 
                    key={event.id}
                    className="flex items-center justify-between p-3.5 bg-muted/20 border border-border/65 rounded-xl hover:bg-muted/40 transition-all duration-200 group cursor-pointer"
                    onClick={() => {
                      if (event.type === 'assignment') {
                        navigate(`/assignments?courseId=${event.courseId}&assignmentId=${event.id}`);
                      } else {
                        navigate(`/courses/${event.courseId}`);
                      }
                      onClose();
                    }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {event.type === 'assignment' ? (
                        <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center shrink-0">
                          <ClipboardList size={16} />
                        </div>
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-500 flex items-center justify-center shrink-0">
                          <HelpCircle size={16} />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                          {event.title}
                        </p>
                        <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                          {event.courseTitle}
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                  </div>
                ))
              )}
            </div>

            {/* Bottom Actions */}
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Close
              </Button>
              {isTeacher && (
                <Button onClick={() => setIsCreating(true)} className="flex-1 gap-1.5">
                  <Plus size={15} /> Create Event
                </Button>
              )}
            </div>
          </div>
        ) : (
          /* Event Creation Flow */
          <div className="space-y-4">
            
            {/* Event Type Choice */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Event Type</span>
              <div className="flex bg-muted/40 p-1 rounded-xl border border-border">
                <button
                  type="button"
                  onClick={() => setEventType('assignment')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-200 ${
                    eventType === 'assignment' 
                      ? 'bg-card text-foreground shadow-xs border border-border/80' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Assignment
                </button>
                <button
                  type="button"
                  onClick={() => setEventType('quiz')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-200 ${
                    eventType === 'quiz' 
                      ? 'bg-card text-foreground shadow-xs border border-border/80' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Quiz
                </button>
              </div>
            </div>

            {/* Course Select */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Select Course</span>
              {courses.length === 0 ? (
                <p className="text-xs text-destructive">You don't teach any courses yet.</p>
              ) : (
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-background border border-input rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-input"
                >
                  {courses.map(course => (
                    <option key={course._id || course.id} value={course._id || course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Module Select (for Quiz event type) */}
            {eventType === 'quiz' && (
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Select Module/Section</span>
                {loadingModules ? (
                  <p className="text-xs text-muted-foreground animate-pulse">Loading modules...</p>
                ) : modules.length === 0 ? (
                  <p className="text-xs text-amber-500 italic bg-amber-500/5 p-2 rounded-lg border border-amber-500/10">
                    No modules available. Create a module first in course settings.
                  </p>
                ) : (
                  <select
                    value={selectedModuleId}
                    onChange={(e) => setSelectedModuleId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-background border border-input rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-input"
                  >
                    {modules.map(mod => (
                      <option key={mod.id} value={mod.id}>
                        {mod.title}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsCreating(false)} className="flex-1">
                Back
              </Button>
              <Button 
                onClick={handleContinue} 
                disabled={eventType === 'quiz' && !selectedModuleId} 
                className="flex-1"
              >
                Continue
              </Button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
