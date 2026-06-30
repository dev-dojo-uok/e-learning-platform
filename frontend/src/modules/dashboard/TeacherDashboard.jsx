import React from "react"

export default function TeacherDashboard() {
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
          Welcome to the course management console. Use the sidebar to plan, schedule, and configure course settings.
        </p>
      </div>
    </div>
  );
}
