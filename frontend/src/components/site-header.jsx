import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useLocation } from "react-router-dom"
import useAuthStore from "@/store/useAuthStore"

export function SiteHeader() {
  const location = useLocation()
  const { user } = useAuthStore()

  const getHeaderTitle = () => {
    switch (location.pathname) {
      case "/":
      case "/dashboard":
        return user?.role === "STUDENT" ? "My Enrolled Courses" : "Dashboard Overview"
      case "/courses":
        return "Course Shell & Materials"
      case "/courses/enrolled":
        return "My Enrolled Courses"
      case "/quizzes":
        return "Quiz Definitions & Submissions"
      case "/forums":
        return "Discussion Forums"
      case "/completion":
        return "Progress & Completion Tracking"
      case "/assignments":
        return "Assignments & Grading Console"
      default:
        return "E-Learning Platform"
    }
  }

  return (
    <header
      className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) bg-white">
      <div className="flex w-full items-center gap-1 px-4 py-2 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2" />
        <h1 className="text-base font-bold tracking-tight text-black">{getHeaderTitle()}</h1>
      </div>
    </header>
  );
}
