import React, { useEffect } from "react"
import { Link } from "react-router-dom"
import useCourses from "@/modules/courses/hooks/useCourses"
import { BookOpen, Users, Loader2, AlertCircle, PlusCircle, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function TeacherDashboard() {
  const { courses, loading, error, fetchCourses } = useCourses();

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-black">Welcome back, Professor</h2>
        <p className="text-slate-500 font-medium text-sm">
          Here is what is happening across your e-learning modules today.
        </p>
      </div>

      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-black mb-2">Teacher Dashboard Overview</h3>
        <p className="text-slate-500 text-sm">
          Welcome to the course management console. Use the quick links below or the sidebar to plan, schedule, and configure course settings.
        </p>
      </div>

      {/* Course Management / Enrollments list */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-black flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Your Courses
          </h3>
          <Button asChild size="sm" className="text-white">
            <Link to="/courses/create">
              <PlusCircle className="h-4 w-4 mr-1.5" />
              New Course
            </Link>
          </Button>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-500 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-sm font-medium">Loading courses...</p>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div
            role="alert"
            className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700"
          >
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold">Failed to load courses</p>
              <p className="text-xs mt-0.5 text-red-500">{error}</p>
            </div>
          </div>
        )}

        {/* Courses list */}
        {!loading && !error && (
          courses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <BookOpen className="h-10 w-10 text-slate-300" strokeWidth={1.5} />
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-600">No courses created yet</p>
                <p className="text-xs text-slate-400 mt-1">
                  Create your first course to begin hosting modules and managing student enrollments.
                </p>
              </div>
              <Button asChild className="text-white cursor-pointer">
                <Link to="/courses/create">
                  Create a Course
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <div
                  key={course._id}
                  className="flex flex-col bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h4 className="text-base font-bold text-slate-800 line-clamp-1">
                      {course.title}
                    </h4>
                    {course.category && (
                      <span className="shrink-0 bg-slate-100 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded border border-slate-200">
                        {course.category}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-6 flex-1">
                    {course.description || "No description provided."}
                  </p>
                  <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                    <Button variant="outline" size="sm" className="flex-1 cursor-pointer" asChild>
                      <Link to={`/courses/${course._id}/enrollments`}>
                        <Users className="h-3.5 w-3.5 mr-1" />
                        Students
                      </Link>
                    </Button>
                    <Button variant="secondary" size="sm" className="flex-1 cursor-pointer" asChild>
                      <Link to={`/courses/${course._id}`}>
                        View
                        <ArrowRight className="h-3.5 w-3.5 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
