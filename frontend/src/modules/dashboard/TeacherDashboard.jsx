import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import useCourses from "@/modules/courses/hooks/useCourses"
import { BookOpen, Users, Loader2, AlertCircle, PlusCircle, ArrowRight, Award, FileText, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import api from "@/lib/axios"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

export default function TeacherDashboard() {
  const { courses, loading, error, fetchCourses } = useCourses();

  // ── Step 1: Course Selector & Stat State ──
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [enrolledCount, setEnrolledCount] = useState(0);
  const [quizzesCount, setQuizzesCount] = useState(0);
  const [assignmentsCount, setAssignmentsCount] = useState(0);
  const [statsLoading, setStatsLoading] = useState(false);

  // ── Step 2: Quiz Analytics State ──
  const [quizzesList, setQuizzesList] = useState([]);
  const [selectedQuizId, setSelectedQuizId] = useState("");
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [quizLoading, setQuizLoading] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Default to first course when loaded
  useEffect(() => {
    if (!selectedCourseId && courses && courses.length > 0) {
      setSelectedCourseId(courses[0]._id || courses[0].id);
    }
  }, [courses, selectedCourseId]);

  // Fetch stats for selected course
  useEffect(() => {
    if (selectedCourseId) {
      setStatsLoading(true);
      Promise.all([
        api.get(`/courses/${selectedCourseId}/students`).catch(() => ({ data: [] })),
        api.get(`/quizzes/course/${selectedCourseId}`).catch(() => ({ data: [] })),
        api.get(`/assignments/course/${selectedCourseId}`).catch(() => ({ data: [] }))
      ]).then(([studentsRes, quizzesRes, assignmentsRes]) => {
        const sData = Array.isArray(studentsRes.data) ? studentsRes.data : (studentsRes.data || []);
        const qData = Array.isArray(quizzesRes.data) ? quizzesRes.data : (quizzesRes.data || []);
        const aData = Array.isArray(assignmentsRes.data) ? assignmentsRes.data : (assignmentsRes.data || []);
        
        setEnrolledCount(sData.length);
        setQuizzesCount(qData.length);
        setAssignmentsCount(aData.length);

        setQuizzesList(qData);
        if (qData.length > 0) {
          setSelectedQuizId(qData[0]._id || qData[0].id);
        } else {
          setSelectedQuizId("");
        }
      }).finally(() => {
        setStatsLoading(false);
      });
    }
  }, [selectedCourseId]);

  // Fetch attempts for selected quiz
  useEffect(() => {
    if (selectedQuizId) {
      setQuizLoading(true);
      api.get(`/quizzes/${selectedQuizId}/attempts`)
        .then((res) => {
          setQuizAttempts(Array.isArray(res.data) ? res.data : (res.data || []));
        })
        .catch(() => setQuizAttempts([]))
        .finally(() => setQuizLoading(false));
    } else {
      setQuizAttempts([]);
    }
  }, [selectedQuizId]);

  const selectedCourseObj = courses.find(c => (c._id || c.id) === selectedCourseId);

  // Calculate Quiz Pie Data
  const completedQuizStudents = new Set(
    quizAttempts.map(att => att.studentId || att.userId || att.student?._id || att.student?.id || att.user?._id || att.id)
  ).size;
  const quizCompletedCount = Math.min(completedQuizStudents, enrolledCount || completedQuizStudents);
  const quizRemainingCount = Math.max(0, enrolledCount - quizCompletedCount);
  const quizPieData = [
    { name: "Completed", value: quizCompletedCount, color: "#4F46E5" },
    { name: "Pending", value: quizRemainingCount, color: "#E2E8F0" }
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-black">Welcome back, Professor</h2>
        <p className="text-slate-500 font-medium text-sm">
          Here is what is happening across your e-learning modules today.
        </p>
      </div>

      {/* ── Step 1: Interactive Course Selector & Stats Overview ── */}
      <div className="flex flex-col gap-5 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-black flex items-center gap-2">
              <Award className="h-5 w-5 text-indigo-600" />
              <span>Course Analytics & Overview</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Select one of your courses below to view student enrollment and evaluation metrics.
            </p>
          </div>

          {/* Course Selector Dropdown / Pills */}
          {courses && courses.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto py-1">
              {courses.map((c) => {
                const cid = c._id || c.id;
                const isSelected = selectedCourseId === cid;
                return (
                  <button
                    key={cid}
                    type="button"
                    onClick={() => setSelectedCourseId(cid)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                      isSelected
                        ? "bg-indigo-600 text-white shadow-sm scale-102"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
                    }`}
                  >
                    {c.title}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Course Overview Stats */}
        {statsLoading ? (
          <div className="flex items-center justify-center py-8 gap-2 text-xs text-slate-400 animate-pulse">
            <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
            <span>Loading course analytics...</span>
          </div>
        ) : selectedCourseObj ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">
                Viewing Stats for: <strong className="text-indigo-600 font-bold">{selectedCourseObj.title}</strong>
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Category: {selectedCourseObj.category || "General"}
              </span>
            </div>

            {/* 3 Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-indigo-50/30 border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 font-bold">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Enrolled Students</p>
                  <p className="text-2xl font-extrabold text-slate-800">{enrolledCount}</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-purple-50/30 border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 font-bold">
                  <HelpCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Course Quizzes</p>
                  <p className="text-2xl font-extrabold text-slate-800">{quizzesCount}</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-emerald-50/30 border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 font-bold">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Assignments</p>
                  <p className="text-2xl font-extrabold text-slate-800">{assignmentsCount}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-slate-400">
            Please select or create a course to view analytics.
          </div>
        )}
      </div>

      {/* ── Step 2: Interactive Quiz Completion Section with Pie Chart ── */}
      {selectedCourseObj && (
        <div className="flex flex-col gap-5 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-black flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-purple-600" />
                <span>Quiz Completion Analytics</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Select a quiz below to view the completion ratio of your enrolled students.
              </p>
            </div>

            {/* Quiz Selector Dropdown */}
            {quizzesList && quizzesList.length > 0 ? (
              <select
                value={selectedQuizId}
                onChange={(e) => setSelectedQuizId(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-600 cursor-pointer"
              >
                {quizzesList.map((q) => (
                  <option key={q._id || q.id} value={q._id || q.id}>
                    {q.title}
                  </option>
                ))}
              </select>
            ) : (
              <span className="text-xs text-slate-400 font-medium italic">No Quizzes Available</span>
            )}
          </div>

          {quizzesList.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No quizzes created for this course yet.
            </div>
          ) : quizLoading ? (
            <div className="flex items-center justify-center py-12 gap-2 text-xs text-slate-400 animate-pulse">
              <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
              <span>Loading quiz completion data...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Pie Chart */}
              <div className="h-[200px] w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={quizPieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      strokeWidth={2}
                    >
                      {quizPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(val) => [`${val} Student(s)`, 'Count']}
                      contentStyle={{ borderRadius: '8px', fontSize: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Text Breakdown */}
              <div className="flex flex-col justify-center space-y-3 p-4 bg-slate-50/70 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                  <span className="text-xs font-semibold text-slate-600">Completed: <strong className="text-slate-800">{quizCompletedCount}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                  <span className="text-xs font-semibold text-slate-600">Pending: <strong className="text-slate-800">{quizRemainingCount}</strong></span>
                </div>
                <div className="pt-2 border-t border-slate-200/60 text-xs text-slate-500">
                  <span className="font-bold text-indigo-600 text-sm">
                    {enrolledCount > 0 ? Math.round((quizCompletedCount / enrolledCount) * 100) : 0}%
                  </span> of enrolled students have completed this evaluation.
                </div>
              </div>
            </div>
          )}
        </div>
      )}

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

