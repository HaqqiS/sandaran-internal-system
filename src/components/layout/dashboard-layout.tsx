"use client"

import type * as React from "react"
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar"
import type { SidebarConfig } from "~/types/dashboard"
import { AppSidebar } from "./app-sidebar"
import { SiteHeader } from "./site-header"

interface DashboardLayoutProps {
  children: React.ReactNode
  sidebarConfig: SidebarConfig
  headerTitle?: string
  headerActions?: React.ReactNode
  sidebarVariant?: "sidebar" | "floating" | "inset"
}

export function DashboardLayout({
  children,
  sidebarConfig,
  headerTitle,
  headerActions,
  sidebarVariant = "inset",
}: DashboardLayoutProps) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar config={sidebarConfig} variant={sidebarVariant} />
      <SidebarInset>
        <SiteHeader title={headerTitle} actions={headerActions} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
