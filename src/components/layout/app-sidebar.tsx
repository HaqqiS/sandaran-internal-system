"use client"

import Link from "next/link"
import type * as React from "react"
import {
  NavDocuments,
  NavMain,
  NavSecondary,
  NavUser,
} from "~/components/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar"
import type { SidebarConfig } from "~/types/dashboard"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  config: SidebarConfig
}

export function AppSidebar({ config, ...props }: AppSidebarProps) {
  const {
    user,
    navMain,
    navDocuments = [],
    navSecondary = [],
    companyName = "Sandaran Home Living",
    companyIcon: CompanyIcon,
  } = config

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link href="/dashboard">
                {CompanyIcon && <CompanyIcon className="size-5!" />}
                <span className="text-base font-semibold">{companyName}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        {navDocuments.length > 0 && <NavDocuments items={navDocuments} />}
        {navSecondary.length > 0 && (
          <NavSecondary items={navSecondary} className="mt-auto" />
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
