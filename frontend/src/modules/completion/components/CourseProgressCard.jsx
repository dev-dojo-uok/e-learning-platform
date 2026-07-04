"use client"

import { useEffect } from "react"
import { BookOpen, FileText, CheckCircle2, Circle } from "lucide-react"
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

  // Fetch data on mount
  useEffect(() => {
    if (courseId) {
      fetchCourseProgress(courseId)
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
    { name: "completed", value: completedTasks, fill: "#5C29C2" },
    { name: "remaining", value: totalTasks === 0 ? 1 : remainingTasks, fill: "#DAD9DB" }
  ]

  const chartConfig = {
    completed: { label: "Completed", color: "#5C29C2" },
    remaining: { label: "Remaining", color: "#DAD9DB" }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl items-stretch">

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
                startAngle={360}
                endAngle={0}
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
            <Progress value={quizPercentage} className="h-2 w-full bg-slate-200" indicatorClassName="bg-[#5C29C2]" />
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

              <Progress value={assignmentPercentage} className="h-2 w-full mt-2 bg-slate-200" indicatorClassName="bg-[#5C29C2]" />

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
    </div>
  )
}