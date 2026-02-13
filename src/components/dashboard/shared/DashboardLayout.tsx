"use client"

import type { ReactNode } from "react"

interface DashboardLayoutProps {
  title: string
  description?: string
  children: ReactNode
}

export function DashboardLayout({
  title,
  description,
  children,
}: DashboardLayoutProps) {
  return (
    <div className="flex flex-col gap-8 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-muted-foreground mt-2">{description}</p>
        )}
      </div>

      <div className="space-y-10">{children}</div>
    </div>
  )
}
