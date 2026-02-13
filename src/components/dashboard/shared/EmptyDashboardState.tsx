"use client"

import type { ReactNode } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"

interface EmptyDashboardStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyDashboardState({
  icon,
  title,
  description,
  action,
}: EmptyDashboardStateProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>No Data</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center gap-4 py-8 text-center">
          {icon && <div className="text-muted-foreground/50">{icon}</div>}
          <div>
            <h3 className="text-lg font-medium">{title}</h3>
            {description && (
              <p className="mt-2 text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          {action && <div className="mt-4">{action}</div>}
        </div>
      </CardContent>
    </Card>
  )
}
