"use client"

import { useEffect } from "react"
import { TrendingUp, BookOpen, FileText } from "lucide-react"
import {
  Label,
  Pie,
  PieChart,
} from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
  const { progressData, isLoading, fetchCourseProgress } = useCompletionStore()

  // Fetch data on mount
  useEffect(() => {
    if (courseId) {
      fetchCourseProgress(courseId)
    }
  }, [courseId, fetchCourseProgress])

  if (isLoading) {
    return <div className="p-8 text-center animate-pulse">Loading progress...</div>
  }

  // Fallback data if store is empty
  const totalQuizzes = progressData?.totalQuizzes || 0
  const completedQuizzes = progressData?.completedQuizzes || 0

  const totalTasks = totalQuizzes
  const completedTasks = completedQuizzes
  const remainingTasks = totalTasks - completedTasks
  const overallPercentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100)

  // Chart configuration mapped to your learning data
  const chartData = [
    { name: "completed", value: completedTasks, fill: "#5C29C2" },
    { name: "remaining", value: totalTasks === 0 ? 1 : remainingTasks, fill: "#DAD9DB" }
  ]

  const chartConfig = {
    completed: {
      label: "Completed",
      color: "#5C29C2", // Custom purple color requested
    },
    remaining: {
      label: "Remaining",
      color: "#DAD9DB", // Uses a muted color for incomplete
    },
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">

      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle className="text-lg font-bold text-slate-800">Overall Progress</CardTitle>
          <CardDescription className="text-sm text-slate-500">All course materials</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1 items-center pb-0">
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square w-full max-w-[250px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                innerRadius={80}
                outerRadius={110}
                startAngle={180}
                endAngle={0}
                strokeWidth={0}
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) - 16}
                            className="fill-slate-900 text-3xl font-bold"
                          >
                            {overallPercentage}%
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 8}
                            className="fill-slate-500 text-sm font-medium"
                          >
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

      {/* RIGHT SIDE: Breakdown Targets */}
      <Card className="flex flex-col border-none shadow-none bg-transparent">
        <CardHeader className="px-0">
          <CardTitle className="text-lg font-bold text-slate-800">Module Breakdown</CardTitle>
          <CardDescription className="text-sm text-slate-500">Monitor your progress across different task types.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 px-0">

          {/* Quizzes Breakdown */}
          <div className="space-y-2 p-4 rounded-xl bg-card border border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <BookOpen className="w-4 h-4" /> Quizzes
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900">
              {completedQuizzes} <span className="text-lg font-medium text-slate-400">/ {totalQuizzes}</span>
            </div>
            <Progress
              value={totalQuizzes === 0 ? 0 : Math.round((completedQuizzes / totalQuizzes) * 100)}
              className="h-2 w-full bg-secondary"
              indicatorClassName="bg-[#5C29C2]"
            />
            <div className="text-xs font-medium text-slate-500 flex justify-between">
              <span>{totalQuizzes === 0 ? 0 : Math.round((completedQuizzes / totalQuizzes) * 100)}% achieved</span>
              <span>{totalQuizzes - completedQuizzes} remaining</span>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  )
}
