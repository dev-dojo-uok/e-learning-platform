"use client"

import { useEffect } from "react"
import { TrendingUp, BookOpen, FileText } from "lucide-react"
import {
  Label,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
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
  
  // NOTE: Your backend currently doesn't send assignment data. 
  // We are mocking it here so the UI matches your request.
  const totalAssignments = progressData?.totalAssignments || 4 
  const completedAssignments = progressData?.completedAssignments || 1

  const totalTasks = totalQuizzes + totalAssignments
  const completedTasks = completedQuizzes + completedAssignments
  const remainingTasks = totalTasks - completedTasks
  const overallPercentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100)

  // Chart configuration mapped to your learning data
  const chartData = [{ name: "Progress", completed: completedTasks, remaining: remainingTasks }]
  const chartConfig = {
    completed: {
      label: "Completed",
      color: "hsl(var(--primary))", // Uses your theme's main color
    },
    remaining: {
      label: "Remaining",
      color: "hsl(var(--muted))", // Uses a muted color for incomplete
    },
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
      
      {/* LEFT SIDE: Radial Chart */}
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle>Overall Progress</CardTitle>
          <CardDescription>All course materials</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1 items-center pb-0">
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square w-full max-w-[250px]"
          >
            <RadialBarChart
              data={chartData}
              endAngle={180}
              innerRadius={80}
              outerRadius={110}
            >
              <RadialBar
                dataKey="remaining"
                fill="var(--color-remaining)"
                stackId="a"
                cornerRadius={5}
                className="stroke-transparent stroke-2"
              />
              <RadialBar
                dataKey="completed"
                fill="var(--color-completed)"
                stackId="a"
                cornerRadius={5}
                className="stroke-transparent stroke-2"
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) - 16}
                            className="fill-foreground text-3xl font-bold"
                          >
                            {overallPercentage}%
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 4}
                            className="fill-muted-foreground"
                          >
                            Completed
                          </tspan>
                        </text>
                      )
                    }
                  }}
                />
              </PolarRadiusAxis>
            </RadialBarChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex-col gap-2 text-sm">
          <div className="flex items-center gap-2 leading-none font-medium">
            You are on track! <TrendingUp className="h-4 w-4 text-green-500" />
          </div>
          <div className="leading-none text-muted-foreground">
            {completedTasks} out of {totalTasks} total tasks finished.
          </div>
        </CardFooter>
      </Card>

      {/* RIGHT SIDE: Breakdown Targets */}
      <Card className="flex flex-col justify-center border-none shadow-none bg-transparent">
        <CardHeader className="px-0">
          <CardTitle>Module Breakdown</CardTitle>
          <CardDescription>Monitor your progress across different task types.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 px-0">
          
          {/* Quizzes Breakdown */}
          <div className="space-y-2 p-4 rounded-xl bg-card border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground uppercase tracking-wider">
                <BookOpen className="w-4 h-4" /> Quizzes
              </div>
            </div>
            <div className="text-3xl font-bold">
              {completedQuizzes} <span className="text-lg font-normal text-muted-foreground">/ {totalQuizzes}</span>
            </div>
            {/* Custom Progress Bar */}
            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-500" 
                style={{ width: `${totalQuizzes === 0 ? 0 : (completedQuizzes / totalQuizzes) * 100}%` }}
              />
            </div>
            <div className="text-xs text-muted-foreground flex justify-between">
              <span>{totalQuizzes === 0 ? 0 : Math.round((completedQuizzes / totalQuizzes) * 100)}% achieved</span>
              <span>{totalQuizzes - completedQuizzes} remaining</span>
            </div>
          </div>

          {/* Assignments Breakdown */}
          <div className="space-y-2 p-4 rounded-xl bg-card border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground uppercase tracking-wider">
                <FileText className="w-4 h-4" /> Assignments
              </div>
            </div>
            <div className="text-3xl font-bold">
              {completedAssignments} <span className="text-lg font-normal text-muted-foreground">/ {totalAssignments}</span>
            </div>
            {/* Custom Progress Bar */}
            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-500" 
                style={{ width: `${totalAssignments === 0 ? 0 : (completedAssignments / totalAssignments) * 100}%` }}
              />
            </div>
            <div className="text-xs text-muted-foreground flex justify-between">
              <span>{totalAssignments === 0 ? 0 : Math.round((completedAssignments / totalAssignments) * 100)}% achieved</span>
              <span>{totalAssignments - completedAssignments} remaining</span>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  )
}
