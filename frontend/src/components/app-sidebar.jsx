import * as React from "react"
import { Link } from "react-router-dom"

import { DatePicker } from "@/components/date-picker"
import { NavUser } from "@/components/nav-user"
import { NavMain } from "@/components/nav-main"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar"
import { 
  PlusIcon,
  LayoutDashboardIcon,
  BookOpen,
  CircleHelpIcon,
  MessageSquareIcon,
  CheckSquareIcon,
  FileTextIcon,
  ChevronRightIcon,
  Users
} from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import useAuthStore from "@/store/useAuthStore"
import useCourses from "@/modules/courses/hooks/useCourses"
import api from "@/lib/axios"
import CalendarEventModal from "@/components/CalendarEventModal"

export function AppSidebar({
  ...props
}) {
  const { user } = useAuthStore()
  const { courses, fetchCourses } = useCourses()

  const [displayCourses, setDisplayCourses] = React.useState([])
  const [events, setEvents] = React.useState([])
  const [selectedDate, setSelectedDate] = React.useState(null)
  const [isModalOpen, setIsModalOpen] = React.useState(false)

  // Fetch courses on mount / user change
  React.useEffect(() => {
    if (!user) return;

    const loadCourses = async () => {
      try {
        if (user.role === 'STUDENT') {
          const res = await api.get(`/students/${user.id}/courses`);
          const enrolled = (res.data || []).map(e => ({
            ...e.course,
            _id: e.course.id
          }));
          setDisplayCourses(enrolled);
        } else {
          await fetchCourses();
        }
      } catch (err) {
        console.error("Failed to fetch user courses:", err);
      }
    };

    loadCourses();
  }, [user, fetchCourses]);

  // Keep displayCourses in sync with store courses for teachers
  React.useEffect(() => {
    if (user && user.role !== 'STUDENT') {
      setDisplayCourses(courses);
    }
  }, [courses, user]);

  // Fetch assignments & quizzes for user courses
  React.useEffect(() => {
    if (user && displayCourses.length > 0) {
      const loadEvents = async () => {
        try {
          const allEvents = []
          await Promise.all(
            displayCourses.map(async (course) => {
              const courseId = course._id || course.id
              
              // 1. Fetch Assignments
              try {
                const asgRes = await api.get(`/assignments/course/${courseId}`)
                const assignments = asgRes.data || []
                assignments.forEach(asg => {
                  allEvents.push({
                    id: asg.id,
                    title: asg.title,
                    type: 'assignment',
                    date: new Date(asg.dueDate),
                    courseId: courseId,
                    courseTitle: course.title,
                  })
                })
              } catch (err) {
                console.error(`Failed to fetch assignments for course ${courseId}:`, err)
              }

              // 2. Fetch Quizzes
              try {
                const quizRes = await api.get(`/quizzes/course/${courseId}`)
                const quizzes = quizRes.data || []
                quizzes.forEach(quiz => {
                  allEvents.push({
                    id: quiz.id,
                    title: quiz.title,
                    type: 'quiz',
                    date: quiz.closeTime ? new Date(quiz.closeTime) : new Date(quiz.openTime || quiz.createdAt),
                    courseId: courseId,
                    courseTitle: course.title,
                  })
                })
              } catch (err) {
                console.error(`Failed to fetch quizzes for course ${courseId}:`, err)
              }
            })
          )
          setEvents(allEvents)
        } catch (err) {
          console.error("Error loading events:", err)
        }
      }
      loadEvents()
    }
  }, [user, displayCourses])

  const displayUser = {
    name: user?.name || "E-Learner",
    email: user?.email || "learner@uok.lk",
    avatar: "",
  }

  const navigationLinks = [
    ...(user?.role === "TEACHER" || user?.role === "ADMIN" ? [
      {
        title: "Dashboard",
        url: "/",
        icon: <LayoutDashboardIcon />,
      },
      ...(displayCourses && displayCourses.length > 0 ? [{
        title: "Enrollment Management",
        url: `/courses/${displayCourses[0]._id}/enrollments`,
        icon: <Users />,
      }] : [])
    ] : [
      {
        title: "My Enrolled Courses",
        url: "/courses/enrolled",
        icon: <CheckSquareIcon />,
      }
    ]),
    {
      title: "Courses",
      url: "/courses",
      icon: <BookOpen />,
    },
  ];

  return (
    <Sidebar {...props}>
      <SidebarHeader className=" flex items-center justify-center ">
        <div className="px-2 py-1 bg-muted w-full h-full rounded-lg">
        <NavUser user={displayUser} />
        </div>
        
      </SidebarHeader>
      <SidebarContent>
        {/* Navigation Links */}
        {navigationLinks.length > 0 && (
          <>
            <NavMain items={navigationLinks} />
            <SidebarSeparator className="mx-0" />
          </>
        )}
        
        {/* Collapsible Calendar */}
        <SidebarGroup>
          <Collapsible defaultOpen={true} className="group/collapsible">
            <SidebarGroupLabel
              asChild
              className="group/label w-full text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
              <CollapsibleTrigger>
                Calendar{" "}
                <ChevronRightIcon
                  className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent className="flex justify-center ">
                <DatePicker 
                  events={events}
                  onSelectDate={(date) => {
                    setSelectedDate(date);
                    setIsModalOpen(true);
                  }}
                />
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>
        <SidebarSeparator className="mx-0" />
        
        {/* Collapsible Courses list */}
        <SidebarGroup>
          <Collapsible defaultOpen={true} className="group/collapsible">
            <SidebarGroupLabel
              asChild
              className="group/label w-full text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
              <CollapsibleTrigger>
                My Courses{" "}
                <ChevronRightIcon
                  className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {displayCourses && displayCourses.length > 0 ? (
                    displayCourses.map((course) => (
                      <SidebarMenuItem key={course._id}>
                        <SidebarMenuButton asChild>
                          <Link to={`/courses/${course._id}`}>
                            <span>{course.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-xs text-slate-400 font-semibold italic">
                      {user?.role === 'TEACHER' ? 'No courses created' : 'No courses enrolled'}
                    </div>
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="px-4 py-2 text-[10px] text-center text-slate-400 font-bold">
          SWST 32043 Group Project
        </div>
      </SidebarFooter>
      <CalendarEventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        date={selectedDate}
        events={events}
        courses={displayCourses}
        isTeacher={user?.role === 'TEACHER' || user?.role === 'ADMIN'}
      />
      <SidebarRail />
    </Sidebar>
  );
}
