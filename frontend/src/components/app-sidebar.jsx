import * as React from "react"

import { Calendars } from "@/components/calendars"
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
  ChevronRightIcon
} from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import useAuthStore from "@/store/useAuthStore"

const data = {
  calendars: [
    // {
    //   name: "Deadlines & Events",
    //   items: ["Assignment 1 Due", "Quiz 2 Open", "Midterm Exam"],
    // },
    {
      name: "My Courses",
      items: ["SWST 32043 - Rapid App Dev", "SWST 32013 - Software Quality", "COSC 31023 - Data Science"],
    },
  ],
}

export function AppSidebar({
  ...props
}) {
  const { user } = useAuthStore()

  const displayUser = {
    name: user?.name || "E-Learner",
    email: user?.email || "learner@uok.lk",
    avatar: "",
  }

  const navigationLinks = [
    ...(user?.role === "TEACHER" || user?.role === "ADMIN" ? [{
      title: "Dashboard",
      url: "/",
      icon: <LayoutDashboardIcon />,
    }] : []),
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
                <DatePicker  />
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>
        <SidebarSeparator className="mx-0" />
        
        <Calendars calendars={data.calendars} />
      </SidebarContent>
      <SidebarFooter>
        <div className="px-4 py-2 text-[10px] text-center text-slate-400 font-bold">
          SWST 32043 Group Project
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
