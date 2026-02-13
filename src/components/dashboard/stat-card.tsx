import type { TablerIcon } from "@tabler/icons-react"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { cn } from "~/lib/utils"

interface StatCardProps {
  title: string
  value: string | number
  icon: TablerIcon
  description?: string
  trend?: {
    value: number | string
    label: string
    positive?: boolean
  }
  className?: string
  action?: React.ReactNode
  variant?: "default" | "success" | "warning" | "error"
  isLoading?: boolean
}

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  className,
  action,
  variant = "default",
  isLoading = false,
}: StatCardProps) {
  const variantStyles = {
    default: "",
    success: "border-green-200 bg-green-50/50",
    warning: "border-amber-200 bg-amber-50/50",
    error: "border-red-200 bg-red-50/50",
  }

  if (isLoading) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          <div className="h-4 w-4 animate-pulse rounded bg-muted" />
        </CardHeader>
        <CardContent>
          <div className="h-8 w-32 animate-pulse rounded bg-muted" />
          <div className="mt-2 h-3 w-40 animate-pulse rounded bg-muted" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("overflow-hidden", variantStyles[variant], className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">{value}</div>
          {action && <div>{action}</div>}
        </div>
        {(description || trend) && (
          <p className="text-xs text-muted-foreground mt-1">
            {trend && (
              <span
                className={cn(
                  "mr-2 font-medium",
                  trend.positive === true && "text-green-600",
                  trend.positive === false && "text-red-600",
                )}
              >
                {trend.value}
              </span>
            )}
            {trend && (
              <span className="text-muted-foreground">{trend.label}</span>
            )}
            {!trend && description}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
