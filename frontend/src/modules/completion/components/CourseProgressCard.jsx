"use client"

import { useEffect, useState } from "react"
import { BookOpen, FileText, CheckCircle2, Circle, MessageSquare } from "lucide-react"
import { Link } from "react-router-dom"
import api from "@/lib/axios"
import {
  Label,
  Pie,
  PieChart,
} from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Progress } from "@/components/ui/progress"

// Import your Zustand store (Adjust path if necessary)
import useCompletionStore from "../store/useCompletionStore"

export function CourseProgressCard({ courseId }) {
  const { progressData, isLoading, error, fetchCourseProgress } = useCompletionStore()
  const [latestThread, setLatestThread] = useState(null)
  const [latestMaterial, setLatestMaterial] = useState(null)
  const [updatesLoading, setUpdatesLoading] = useState(false)

  // Fetch data on mount
  useEffect(() => {
    if (courseId) {
      fetchCourseProgress(courseId)

      // Fetch latest teacher message and latest uploaded material
      setUpdatesLoading(true)
      Promise.all([
        api.get(`/forums/${courseId}`).catch(() => ({ data: [] })),
        api.get(`/modules/course/${courseId}`).catch(() => ({ data: [] }))
      ]).then(async ([forumsRes, modulesRes]) => {
        const forums = Array.isArray(forumsRes.data) ? forumsRes.data : (forumsRes.data || [])
        const modules = Array.isArray(modulesRes.data) ? modulesRes.data : (modulesRes.data || [])

        // Fetch threads from forums
        let allThreads = []
        if (forums.length > 0) {
          const threadsResults = await Promise.all(
            forums.map(f => api.get(`/threads/forum/${f._id || f.id}`).catch(() => ({ data: [] })))
          )
          threadsResults.forEach(res => {
            const list = Array.isArray(res.data) ? res.data : (res.data?.threads || [])
            allThreads.push(...list)
          })
        }
        allThreads.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        setLatestThread(allThreads[0] || null)

        // Fetch materials from modules
        let allMaterials = []
        if (modules.length > 0) {
          const matResults = await Promise.all(
            modules.map(m => api.get(`/materials/module/${m._id || m.id}`).catch(() => ({ data: [] })))
          )
          matResults.forEach(res => {
            const list = Array.isArray(res.data) ? res.data : (res.data || [])
            allMaterials.push(...list)
          })
        }
        allMaterials.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        setLatestMaterial(allMaterials[0] || null)
      }).finally(() => {
        setUpdatesLoading(false)
      })
    }
  }, [courseId, fetchCourseProgress])

  if (isLoading) {
    return <div className="p-8 text-center animate-pulse text-slate-500">Loading progress...</div>
  }

  if (error && !progressData) {
    return (
      <div className="p-6 text-center text-sm text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
        {error}
      </div>
    )
  }


  // Safe fallback extractions to completely prevent blank screen crashes
  const totalQuizzes = progressData?.totalQuizzes || 0
  const completedQuizzes = progressData?.completedQuizzes || 0

  const totalAssignments = progressData?.totalAssignments || 0
  const completedAssignments = progressData?.completedAssignments || 0

  // Safely default to empty array if data isn't returned yet
  const assignmentsList = Array.isArray(progressData?.assignments) ? progressData.assignments : []

  // Combine overall targets for the parent Pie Chart
  const totalTasks = totalQuizzes + totalAssignments
  const completedTasks = completedQuizzes + completedAssignments
  const remainingTasks = Math.max(0, totalTasks - completedTasks)
  const overallPercentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100)

  // Individual segment status calculation
  const quizPercentage = totalQuizzes === 0 ? 0 : Math.round((completedQuizzes / totalQuizzes) * 100)
  const assignmentPercentage = totalAssignments === 0 ? 0 : Math.round((completedAssignments / totalAssignments) * 100)

  // Chart configuration mapped to your learning data
  const chartData = [
    { name: "completed", value: completedTasks, fill: "var(--primary)" },
    { name: "remaining", value: totalTasks === 0 ? 1 : remainingTasks, fill: "#DAD9DB" }
  ]

  const chartConfig = {
    completed: { label: "Completed", color: "var(--primary)" },
    remaining: { label: "Remaining", color: "#DAD9DB" }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full items-stretch">

      {/* LEFT SIDE: Pie Chart Display */}
      <Card className="flex flex-col border border-slate-200 shadow-sm bg-white h-full justify-between">
        <CardHeader className="items-center pb-0">
          <CardTitle className="text-lg font-bold text-slate-800">Overall Progress</CardTitle>
          <CardDescription className="text-sm text-slate-500">All course materials</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1 items-center pb-6 min-h-[180px]">
          <ChartContainer config={chartConfig} className="mx-auto aspect-square w-full max-w-[300px]">
            <PieChart>
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                innerRadius={110}
                outerRadius={140}
                startAngle={90}
                endAngle={-270}
                strokeWidth={0}
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                          <tspan x={viewBox.cx} y={(viewBox.cy || 0) - 12} className="fill-slate-900 text-3xl font-bold">
                            {overallPercentage}%
                          </tspan>
                          <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 12} className="fill-slate-500 text-sm font-medium">
                            Completed
                          </tspan>
                        </text>
                      )
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* RIGHT SIDE: Module Breakdown Progress Targets */}
      <Card className="flex flex-col border border-slate-200 shadow-sm bg-white h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold text-slate-800">Module Breakdown</CardTitle>
          <CardDescription className="text-sm text-slate-500">Monitor your progress across different task types.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 flex-1 flex flex-col justify-between">

          {/* Quizzes Breakdown Card Box */}
          <div className="space-y-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <BookOpen className="w-4 h-4" /> Quizzes
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {completedQuizzes} <span className="text-base font-medium text-slate-400">/ {totalQuizzes}</span>
            </div>
            <Progress value={quizPercentage} className="h-2 w-full bg-slate-200" indicatorClassName="bg-primary" />
            <div className="text-xs font-medium text-slate-500 flex justify-between">
              <span>{quizPercentage}% achieved</span>
              <span>{Math.max(0, totalQuizzes - completedQuizzes)} remaining</span>
            </div>
          </div>

          {/* Assignments Breakdown Card Box */}
          <div className="space-y-3 p-3 rounded-xl bg-slate-50 border border-slate-100 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <FileText className="w-4 h-4" /> Assignments
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900">
                {completedAssignments} <span className="text-base font-medium text-slate-400">/ {totalAssignments}</span>
              </div>

              <Progress value={assignmentPercentage} className="h-2 w-full mt-2 bg-slate-200" indicatorClassName="bg-primary" />

              <div className="text-xs font-medium text-slate-500 flex justify-between mt-1">
                <span>{assignmentPercentage}% achieved</span>
                <span>{Math.max(0, totalAssignments - completedAssignments)} remaining</span>
              </div>
            </div>

            {/* Granular Task Checklist Container */}
            {assignmentsList.length > 0 && (
              <div className="pt-2 border-t border-slate-200 space-y-1.5 mt-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Task List</p>

                <div className="max-h-[76px] overflow-y-auto pr-1 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-200">
                  {assignmentsList.map((assignment) => {
                    if (!assignment) return null;
                    const isDone = Array.isArray(assignment.submissions) && assignment.submissions.length > 0;

                    const formattedDueDate = assignment.dueDate
                      ? new Date(assignment.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                      : null;

                    return (
                      <div key={assignment.id} className="flex items-center gap-2 text-sm min-w-0 py-0.5">
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-300 shrink-0" />
                        )}

                        {formattedDueDate && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-500 shrink-0">
                            {formattedDueDate}
                          </span>
                        )}

                        <span className="truncate font-medium text-slate-700">
                          {assignment.title || "Untitled Assignment"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

        </CardContent>
      </Card>

      {/* RIGHT SIDE (NEW 3rd CARD): Recent Course Updates */}
      <Card className="flex flex-col border border-slate-200 shadow-sm bg-white h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold text-slate-800">Course Updates</CardTitle>
          <CardDescription className="text-sm text-slate-500">Latest messages & materials from your teacher.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 flex-1 flex flex-col justify-between">

          {/* Newest Teacher Message Box */}
          <div className="space-y-2 p-3 rounded-xl bg-slate-50 border border-slate-100 flex-1 flex flex-col justify-center">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <MessageSquare className="w-4 h-4 text-primary" /> Latest Teacher Message
              </div>
              {latestThread?.createdAt && (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-500">
                  {new Date(latestThread.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
              )}
            </div>

            {updatesLoading ? (
              <div className="text-xs text-slate-400 italic py-2">Loading latest message...</div>
            ) : latestThread ? (
              <Link to={`/threads/${latestThread.id}`} className="block group mt-1">
                <p className="text-sm font-bold text-slate-800 group-hover:text-primary transition-colors line-clamp-1">
                  {latestThread.title}
                </p>
                {latestThread.content && (
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {latestThread.content}
                  </p>
                )}
                <span className="text-[10px] font-semibold text-primary mt-2 inline-block">View Discussion →</span>
              </Link>
            ) : (
              <div className="text-xs text-slate-400 italic py-3 text-center">
                No teacher messages posted yet.
              </div>
            )}
          </div>

          {/* Latest Uploaded File Box */}
          <div className="space-y-2 p-3 rounded-xl bg-slate-50 border border-slate-100 flex-1 flex flex-col justify-center">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <FileText className="w-4 h-4 text-primary" /> Latest Uploaded File
              </div>
              {latestMaterial?.createdAt && (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-500">
                  {new Date(latestMaterial.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
              )}
            </div>

            {updatesLoading ? (
              <div className="text-xs text-slate-400 italic py-2">Loading uploaded file...</div>
            ) : latestMaterial ? (
              <div className="mt-1 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate" title={latestMaterial.title}>
                    {latestMaterial.title}
                  </p>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5 inline-block">
                    {latestMaterial.type || 'MATERIAL'}
                  </span>
                </div>
                {latestMaterial.contentUrl && (
                  <a
                    href={latestMaterial.contentUrl.startsWith('http') ? latestMaterial.contentUrl : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}/${latestMaterial.contentUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="px-2.5 py-1 rounded-lg text-xs font-bold text-primary-foreground bg-primary hover:bg-primary/90 transition-all whitespace-nowrap shadow-sm"
                  >
                    Download
                  </a>
                )}
              </div>
            ) : (
              <div className="text-xs text-slate-400 italic py-3 text-center">
                No course files uploaded yet.
              </div>
            )}
          </div>

        </CardContent>
      </Card>
    </div>
  )
}