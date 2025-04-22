"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { BookOpen, Calendar, FileText, GraduationCap, Home, List, LogOut, User, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function DashboardSidebar() {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const [menuItems, setMenuItems] = useState<{ title: string; href: string; icon: React.ElementType }[]>([])

  useEffect(() => {
    if (!user) return

    // Define menu items based on user role
    const items: { [key: string]: { title: string; href: string; icon: React.ElementType }[] } = {
      student: [
        { title: "Dashboard", href: "/dashboard", icon: Home },
        { title: "Graduation Status", href: "/dashboard/graduation-status", icon: GraduationCap },
        { title: "Certification Status", href: "/dashboard/certification-status", icon: FileText },
        { title: "Ceremony Details", href: "/dashboard/ceremony-details", icon: Calendar },
        { title: "Profile", href: "/dashboard/profile", icon: User },
      ],
      advisor: [
        { title: "Dashboard", href: "/dashboard", icon: Home },
        { title: "Review Requests", href: "/dashboard/review-requests", icon: List },
        { title: "Student Information", href: "/dashboard/student-info", icon: Users },
        { title: "Finalize List", href: "/dashboard/finalize-list", icon: FileText },
        { title: "Profile", href: "/dashboard/profile", icon: User },
      ],
      department_secretary: [
        { title: "Dashboard", href: "/dashboard", icon: Home },
        { title: "Advisor Lists", href: "/dashboard/advisor-lists", icon: List },
        { title: "Finalize Department List", href: "/dashboard/finalize-department", icon: FileText },
        { title: "Profile", href: "/dashboard/profile", icon: User },
      ],
      deans_office: [
        { title: "Dashboard", href: "/dashboard", icon: Home },
        { title: "Faculty Lists", href: "/dashboard/faculty-lists", icon: List },
        { title: "Finalize Faculty List", href: "/dashboard/finalize-faculty", icon: FileText },
        { title: "Profile", href: "/dashboard/profile", icon: User },
      ],
      student_affairs: [
        { title: "Dashboard", href: "/dashboard", icon: Home },
        { title: "Faculty Lists", href: "/dashboard/faculty-lists", icon: List },
        { title: "Finalize Graduate Lists", href: "/dashboard/finalize-graduates", icon: FileText },
        { title: "Ceremony Management", href: "/dashboard/ceremony", icon: Calendar },
        { title: "Exmatriculation Forms", href: "/dashboard/exmatriculation", icon: BookOpen },
        { title: "Profile", href: "/dashboard/profile", icon: User },
      ],
    }

    setMenuItems(items[user.role] || [])
  }, [user])

  if (!user) return null

  return (
    <Sidebar>
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center space-x-2">
          <GraduationCap className="h-6 w-6" />
          <span className="text-lg font-bold">AGMS</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild isActive={pathname === item.href}>
                <Link href={item.href}>
                  <item.icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <Button variant="ghost" className="w-full justify-start" onClick={logout}>
          <LogOut className="mr-2 h-5 w-5" />
          <span>Logout</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}
