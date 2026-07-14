import React, { useState, useEffect } from "react";
import { HelpCircle, FileText, Loader2, Users } from "lucide-react";
import api from "@/lib/axios";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export default function CourseEvaluationAnalytics({ courseId }) {
  const [enrolledCount, setEnrolledCount] = useState(0);
  const [quizzesList, setQuizzesList] = useState([]);
  const [assignmentsList, setAssignmentsList] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);

  // Quiz Analytics State
  const [selectedQuizId, setSelectedQuizId] = useState("");
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [quizLoading, setQuizLoading] = useState(false);

  // Assignment Analytics State
  const [selectedAssignmentId, setSelectedAssignmentId] = useState("");
  const [assignmentSubmissions, setAssignmentSubmissions] = useState([]);
  const [assignmentLoading, setAssignmentLoading] = useState(false);

  useEffect(() => {
    if (courseId) {
      setStatsLoading(true);
      Promise.all([
        api.get(`/courses/${courseId}/students`).catch(() => ({ data: [] })),
        api.get(`/quizzes/course/${courseId}`).catch(() => ({ data: [] })),
        api.get(`/assignments/course/${courseId}`).catch(() => ({ data: [] }))
      ]).then(([studentsRes, quizzesRes, assignmentsRes]) => {
        const sData = Array.isArray(studentsRes.data) ? studentsRes.data : (studentsRes.data || []);
        const qData = Array.isArray(quizzesRes.data) ? quizzesRes.data : (quizzesRes.data || []);
        const aData = Array.isArray(assignmentsRes.data) ? assignmentsRes.data : (assignmentsRes.data || []);

        setEnrolledCount(sData.length);
        setQuizzesList(qData);
        if (qData.length > 0) {
          setSelectedQuizId(qData[0]._id || qData[0].id);
        } else {
          setSelectedQuizId("");
        }

        setAssignmentsList(aData);
        if (aData.length > 0) {
          setSelectedAssignmentId(aData[0]._id || aData[0].id);
        } else {
          setSelectedAssignmentId("");
        }
      }).finally(() => {
        setStatsLoading(false);
      });
    }
  }, [courseId]);

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

  // Fetch submissions for selected assignment
  useEffect(() => {
    if (selectedAssignmentId) {
      setAssignmentLoading(true);
      api.get(`/assignments/${selectedAssignmentId}/submissions`)
        .then((res) => {
          setAssignmentSubmissions(Array.isArray(res.data) ? res.data : (res.data || []));
        })
        .catch(() => setAssignmentSubmissions([]))
        .finally(() => setAssignmentLoading(false));
    } else {
      setAssignmentSubmissions([]);
    }
  }, [selectedAssignmentId]);

  // Calculate Quiz Pie Data
  const completedQuizStudents = new Set(
    quizAttempts.map(att => att.studentId || att.userId || att.student?._id || att.student?.id || att.user?._id || att.id)
  ).size;
  const quizCompletedCount = Math.min(completedQuizStudents, enrolledCount || completedQuizStudents);
  const quizRemainingCount = Math.max(0, enrolledCount - quizCompletedCount);
  const quizPieData = [
    { name: "Completed", value: quizCompletedCount, color: "#000000" },
    { name: "Pending", value: quizRemainingCount, color: "#DAD9DB" }
  ];

  // Calculate Assignment Pie Data
  const completedAssignmentStudents = new Set(
    assignmentSubmissions.map(sub => sub.studentId || sub.userId || sub.student?._id || sub.student?.id || sub.user?._id || sub.id)
  ).size;
  const assignmentCompletedCount = Math.min(completedAssignmentStudents, enrolledCount || completedAssignmentStudents);
  const assignmentRemainingCount = Math.max(0, enrolledCount - assignmentCompletedCount);
  const assignmentPieData = [
    { name: "Completed", value: assignmentCompletedCount, color: "#000000" },
    { name: "Pending", value: assignmentRemainingCount, color: "#DAD9DB" }
  ];

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center py-12 bg-white rounded-2xl border border-slate-200 shadow-sm gap-2 text-xs text-slate-400 animate-pulse">
        <Loader2 className="h-5 w-5 animate-spin" style={{ color: '#000000' }} />
        <span>Loading evaluation analytics for this course...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Overview Stat Cards */}
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
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 font-bold" style={{ backgroundColor: '#EFEAFF', color: '#000000' }}>
            <HelpCircle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Course Quizzes</p>
            <p className="text-2xl font-extrabold text-slate-800">{quizzesList.length}</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-purple-50/30 border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 font-bold" style={{ backgroundColor: '#EFEAFF', color: '#000000' }}>
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Assignments</p>
            <p className="text-2xl font-extrabold text-slate-800">{assignmentsList.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quiz Completion Analytics */}
        <div className="flex flex-col gap-5 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-black flex items-center gap-2">
                <HelpCircle className="h-5 w-5" style={{ color: '#000000' }} />
                <span>Quiz Completion Analytics</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Select a quiz below to view the completion ratio of enrolled students.
              </p>
            </div>

            {/* Quiz Selector Dropdown */}
            {quizzesList && quizzesList.length > 0 ? (
              <select
                value={selectedQuizId}
                onChange={(e) => setSelectedQuizId(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 cursor-pointer"
                style={{ '--tw-ring-color': '#000000' }}
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
              <Loader2 className="h-5 w-5 animate-spin" style={{ color: '#000000' }} />
              <span>Loading quiz completion data...</span>
            </div>
          ) : (
            <div className="flex flex-col gap-6 items-center">
              {/* Pie Chart */}
              <div className="h-[200px] w-full flex items-center justify-center relative">
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
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-black" style={{ color: '#000000' }}>
                    {enrolledCount > 0 ? Math.round((quizCompletedCount / enrolledCount) * 100) : 0}%
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Done</span>
                </div>
              </div>

              {/* Text Breakdown */}
              <div className="flex flex-col justify-center space-y-3 p-4 bg-slate-50/70 rounded-xl border border-slate-100 w-full">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#000000' }}></div>
                  <span className="text-xs font-semibold text-slate-600">Completed: <strong className="text-slate-800">{quizCompletedCount}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#DAD9DB' }}></div>
                  <span className="text-xs font-semibold text-slate-600">Pending: <strong className="text-slate-800">{quizRemainingCount}</strong></span>
                </div>
                <div className="pt-2 border-t border-slate-200/60 text-xs text-slate-500">
                  <span className="font-bold text-sm" style={{ color: '#000000' }}>
                    {enrolledCount > 0 ? Math.round((quizCompletedCount / enrolledCount) * 100) : 0}%
                  </span> of enrolled students have completed this evaluation.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Assignment Completion Analytics */}
        <div className="flex flex-col gap-5 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-black flex items-center gap-2">
                <FileText className="h-5 w-5" style={{ color: '#000000' }} />
                <span>Assignment Completion Analytics</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Select an assignment below to view student submission rates and progress.
              </p>
            </div>

            {/* Assignment Selector Dropdown */}
            {assignmentsList && assignmentsList.length > 0 ? (
              <select
                value={selectedAssignmentId}
                onChange={(e) => setSelectedAssignmentId(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 cursor-pointer"
                style={{ '--tw-ring-color': '#000000' }}
              >
                {assignmentsList.map((a) => (
                  <option key={a._id || a.id} value={a._id || a.id}>
                    {a.title}
                  </option>
                ))}
              </select>
            ) : (
              <span className="text-xs text-slate-400 font-medium italic">No Assignments Available</span>
            )}
          </div>

          {assignmentsList.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No assignments created for this course yet.
            </div>
          ) : assignmentLoading ? (
            <div className="flex items-center justify-center py-12 gap-2 text-xs text-slate-400 animate-pulse">
              <Loader2 className="h-5 w-5 animate-spin" style={{ color: '#000000' }} />
              <span>Loading assignment submission data...</span>
            </div>
          ) : (
            <div className="flex flex-col gap-6 items-center">
              {/* Pie Chart */}
              <div className="h-[200px] w-full flex items-center justify-center relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={assignmentPieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      strokeWidth={2}
                    >
                      {assignmentPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val) => [`${val} Student(s)`, 'Count']}
                      contentStyle={{ borderRadius: '8px', fontSize: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-black" style={{ color: '#000000' }}>
                    {enrolledCount > 0 ? Math.round((assignmentCompletedCount / enrolledCount) * 100) : 0}%
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Done</span>
                </div>
              </div>

              {/* Text Breakdown */}
              <div className="flex flex-col justify-center space-y-3 p-4 bg-slate-50/70 rounded-xl border border-slate-100 w-full">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#000000' }}></div>
                  <span className="text-xs font-semibold text-slate-600">Completed: <strong className="text-slate-800">{assignmentCompletedCount}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#DAD9DB' }}></div>
                  <span className="text-xs font-semibold text-slate-600">Pending: <strong className="text-slate-800">{assignmentRemainingCount}</strong></span>
                </div>
                <div className="pt-2 border-t border-slate-200/60 text-xs text-slate-500">
                  <span className="font-bold text-sm" style={{ color: '#000000' }}>
                    {enrolledCount > 0 ? Math.round((assignmentCompletedCount / enrolledCount) * 100) : 0}%
                  </span> of enrolled students have submitted this evaluation.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
